(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var stem = require('stem-porter');

//
// Based on javascript implementation https://github.com/awaisathar/lda.js
// Original code based on http://www.arbylon.net/projects/LdaGibbsSampler.java
//
var process = function(sentences, numberOfTopics, numberOfTermsPerTopic, languages, alphaValue, betaValue, randomSeed) {
    // The result will consist of topics and their included terms [[{"term":"word1", "probability":0.065}, {"term":"word2", "probability":0.047}, ... ], [{"term":"word1", "probability":0.085}, {"term":"word2", "probability":0.024}, ... ]].
    var result = [];
    // Index-encoded array of sentences, with each row containing the indices of the words in the vocabulary.
    var documents = new Array();
    // Hash of vocabulary words and the count of how many times each word has been seen.
    var f = {};
    // Vocabulary of unique words (porter stemmed).
    var vocab=new Array();
    // Vocabulary of unique words in their original form.
    var vocabOrig = {};
    // Array of stop words
    languages = languages || Array('en');

    if (sentences && sentences.length > 0) {
      var stopwords = new Array();

      languages.forEach(function(value) {
          var stopwordsLang = require('./stopwords_en.js');
          stopwords = stopwords.concat(stopwordsLang.stop_words);
      });

      for(var i=0;i<sentences.length;i++) {
          if (sentences[i]=="") continue;
          documents[i] = new Array();

          var words = sentences[i] ? sentences[i].split(/[\s,\"]+/) : null;

          if(!words) continue;
          for(var wc=0;wc<words.length;wc++) {
              var w=words[wc].toLowerCase().replace(/[^a-z\'A-Z0-9\u00C0-\u00ff ]+/g, '');
              var wStemmed = stem(w);
              if (w=="" || !wStemmed || w.length==1 || stopwords.indexOf(w.replace("'", "")) > -1 || stopwords.indexOf(wStemmed) > -1 || w.indexOf("http")==0) continue;
              if (f[wStemmed]) { 
                  f[wStemmed]=f[wStemmed]+1;
              } 
              else if(wStemmed) { 
                  f[wStemmed]=1; 
                  vocab.push(wStemmed);
                  vocabOrig[wStemmed] = w;
              };
              
              documents[i].push(vocab.indexOf(wStemmed));
          }
      }

      var V = vocab.length;
      var M = documents.length;
      var K = parseInt(numberOfTopics);
      var alpha = alphaValue || 0.1;  // per-document distributions over topics
      var beta = betaValue || .01;  // per-topic distributions over words
      documents = documents.filter((doc) => { return doc.length }); // filter empty documents

      lda.configure(documents,V,10000, 2000, 100, 10, randomSeed);
      lda.gibbs(K, alpha, beta);

      var theta = lda.getTheta();
      var phi = lda.getPhi();

      var text = '';

      //topics
      var topTerms=numberOfTermsPerTopic;
      for (var k = 0; k < phi.length; k++) {
          var things = new Array();
          for (var w = 0; w < phi[k].length; w++) {
               things.push(""+phi[k][w].toPrecision(2)+"_"+vocab[w] + "_" + vocabOrig[vocab[w]]);
          }
          things.sort().reverse();
          //console.log(things);
          if(topTerms>vocab.length) topTerms=vocab.length;

          //console.log('Topic ' + (k + 1));
          var row = [];
          
          for (var t = 0; t < topTerms; t++) {
              var topicTerm=things[t].split("_")[2];
              var prob=parseInt(things[t].split("_")[0]*100);
              if (prob<2) continue;
              
              //console.log('Top Term: ' + topicTerm + ' (' + prob + '%)');
              
              var term = {};
              term.term = topicTerm;
              term.probability = parseFloat(things[t].split("_")[0]);
              row.push(term);
          }

          result.push(row);
      }
    }
    
    return result;
}

function makeArray(x) {
    var a = new Array();    
    for (var i=0;i<x;i++)  {
        a[i]=0;
    }
    return a;
}

function make2DArray(x,y) {
    var a = new Array();    
    for (var i=0;i<x;i++)  {
        a[i]=new Array();
        for (var j=0;j<y;j++)
            a[i][j]=0;
    }
    return a;
}

var lda = new function() {
    var documents,z,nw,nd,nwsum,ndsum,thetasum,phisum,V,K,alpha,beta; 
    var THIN_INTERVAL = 20;
    var BURN_IN = 100;
    var ITERATIONS = 1000;
    var SAMPLE_LAG;
    var RANDOM_SEED;
    var dispcol = 0;
    var numstats=0;
    this.configure = function (docs,v,iterations,burnIn,thinInterval,sampleLag,randomSeed) {
        this.ITERATIONS = iterations;
        this.BURN_IN = burnIn;
        this.THIN_INTERVAL = thinInterval;
        this.SAMPLE_LAG = sampleLag;
        this.RANDOM_SEED = randomSeed;
        this.documents = docs;
        this.V = v;
        this.dispcol=0;
        this.numstats=0; 
    }
    this.initialState = function (K) {
        var i;
        var M = this.documents.length;
        this.nw = make2DArray(this.V,K); 
        this.nd = make2DArray(M,K); 
        this.nwsum = makeArray(K); 
        this.ndsum = makeArray(M);
        this.z = new Array();   for (i=0;i<M;i++) this.z[i]=new Array();
        for (var m = 0; m < M; m++) {
                var N = this.documents[m].length;
                this.z[m] = new Array();
                for (var n = 0; n < N; n++) {
                    var topic = parseInt(""+(this.getRandom() * K));                 
                    this.z[m][n] = topic;
                    this.nw[this.documents[m][n]][topic]++;
                    this.nd[m][topic]++;
                    this.nwsum[topic]++;
                }
                this.ndsum[m] = N;
        }
    }
    
    this.gibbs = function (K,alpha,beta) {
        var i;
        this.K = K;
        this.alpha = alpha;
        this.beta = beta;
        if (this.SAMPLE_LAG > 0) {
            this.thetasum = make2DArray(this.documents.length,this.K);
            this.phisum = make2DArray(this.K,this.V);
            this.numstats = 0;
        }
        this.initialState(K);
        //document.write("Sampling " + this.ITERATIONS
         //   + " iterations with burn-in of " + this.BURN_IN + " (B/S="
         //   + this.THIN_INTERVAL + ").<br/>");
        for (i = 0; i < this.ITERATIONS; i++) {
            for (var m = 0; m < this.z.length; m++) {
                for (var n = 0; n < this.z[m].length; n++) {
                    var topic = this.sampleFullConditional(m, n);
                    this.z[m][n] = topic;
                }
            }
            if ((i < this.BURN_IN) && (i % this.THIN_INTERVAL == 0)) {
                //document.write("B");
                this.dispcol++;
            }
            if ((i > this.BURN_IN) && (i % this.THIN_INTERVAL == 0)) {
                //document.write("S");
                this.dispcol++;
            }
            if ((i > this.BURN_IN) && (this.SAMPLE_LAG > 0) && (i % this.SAMPLE_LAG == 0)) {
                this.updateParams();
                //document.write("|");                
                if (i % this.THIN_INTERVAL != 0)
                    this.dispcol++;
            }
            if (this.dispcol >= 100) {
                //document.write("*<br/>");                
                this.dispcol = 0;
            }
        }
    }
    
    this.sampleFullConditional = function(m,n) {
        var topic = this.z[m][n];
        this.nw[this.documents[m][n]][topic]--;
        this.nd[m][topic]--;
        this.nwsum[topic]--;
        this.ndsum[m]--;
        var p = makeArray(this.K);
        for (var k = 0; k < this.K; k++) {
            p[k] = (this.nw[this.documents[m][n]][k] + this.beta) / (this.nwsum[k] + this.V * this.beta)
                * (this.nd[m][k] + this.alpha) / (this.ndsum[m] + this.K * this.alpha);
        }
        for (var k = 1; k < p.length; k++) {
            p[k] += p[k - 1];
        }
        var u = this.getRandom() * p[this.K - 1];
        for (topic = 0; topic < p.length; topic++) {
            if (u < p[topic])
                break;
        }
        this.nw[this.documents[m][n]][topic]++;
        this.nd[m][topic]++;
        this.nwsum[topic]++;
        this.ndsum[m]++;
        return topic;
    }
    
    this.updateParams =function () {
        for (var m = 0; m < this.documents.length; m++) {
            for (var k = 0; k < this.K; k++) {
                this.thetasum[m][k] += (this.nd[m][k] + this.alpha) / (this.ndsum[m] + this.K * this.alpha);
            }
        }
        for (var k = 0; k < this.K; k++) {
            for (var w = 0; w < this.V; w++) {
                this.phisum[k][w] += (this.nw[w][k] + this.beta) / (this.nwsum[k] + this.V * this.beta);
            }
        }
        this.numstats++;
    }
    
    this.getTheta = function() {
        var theta = new Array(); for(var i=0;i<this.documents.length;i++) theta[i] = new Array();
        if (this.SAMPLE_LAG > 0) {
            for (var m = 0; m < this.documents.length; m++) {
                for (var k = 0; k < this.K; k++) {
                    theta[m][k] = this.thetasum[m][k] / this.numstats;
                }
            }
        } else {
            for (var m = 0; m < this.documents.length; m++) {
                for (var k = 0; k < this.K; k++) {
                    theta[m][k] = (this.nd[m][k] + this.alpha) / (this.ndsum[m] + this.K * this.alpha);
                }
            }
        }
        return theta;
    }
    
    this.getPhi = function () {
        var phi = new Array(); for(var i=0;i<this.K;i++) phi[i] = new Array();
        if (this.SAMPLE_LAG > 0) {
            for (var k = 0; k < this.K; k++) {
                for (var w = 0; w < this.V; w++) {
                    phi[k][w] = this.phisum[k][w] / this.numstats;
                }
            }
        } else {
            for (var k = 0; k < this.K; k++) {
                for (var w = 0; w < this.V; w++) {
                    phi[k][w] = (this.nw[w][k] + this.beta) / (this.nwsum[k] + this.V * this.beta);
                }
            }
        }
        return phi;
    }

    this.getRandom = function() {
        if (this.RANDOM_SEED) {
            // generate a pseudo-random number using a seed to ensure reproducable results.
            var x = Math.sin(this.RANDOM_SEED++) * 1000000;
            return x - Math.floor(x);
        } else {
            // use standard random algorithm.
            return Math.random();
        }
    }
}

module.exports = process;

},{"./stopwords_en.js":2,"stem-porter":4}],2:[function(require,module,exports){
exports.stop_words = [];

},{}],3:[function(require,module,exports){
var lda = require('./lib/lda');

var text = 'An old man lived in the village. He was one of the most unfortunate people in the world. The whole village was tired of him; he was always gloomy, he constantly complained and was always in a bad mood.The longer he lived, the more bile he was becoming and the more poisonous were his words. People avoided him because his misfortune became contagious. It was even unnatural and insulting to be happy next to him.He created the feeling of unhappiness in others.But one day, when he turned eighty years old, an incredible thing happened. Instantly everyone started hearing the rumour that the Old Man had become happy, he doesn’t complain about anything anymore, always smiles, and even his face is freshened up.';
var text = document.getElementById('extracted_text').innerHTML
var documents = text.match( /[^\.!\?]+[\.!\?]+/g );
text = text.replace(/'/g, '"')
// console.log("'" + text + "'")
console.log(JSON.parse(text))
console.log("--- Topic Modelling ---")
var result = lda(JSON.parse(text), 1, 10, ['en']);

list = [];
for (var i in result[0]) {
  list.push([result[0][i]["term"], result[0][i]["probability"]*1000])
}

WordCloud.minFontSize = "15px"
WordCloud(document.getElementById('word_cloud'), { list: list} );

// For each topic.
for (var i in result) {
	var row = result[i];
	console.log('Topic ' + (parseInt(i) + 1));
  document.getElementById(`head${parseInt(i)+1}`).innerHTML = 'Topic ' + (parseInt(i) + 1);
	
	// For each term.
  var ul = document.getElementById(`content${parseInt(i)+1}`);
	for (var j in row) {
		var term = row[j];
    var li = document.createElement('li');
    li.setAttribute('class','item');

    ul.appendChild(li);
    li.innerHTML = (term.term + ' (' + term.probability + '%)');
		console.log(term.term + ' (' + term.probability + '%)');
	}
	
	console.log('');
}
},{"./lib/lda":1}],4:[function(require,module,exports){
var stemmer = require('./stemmer')

exports = module.exports = require('./langs/english')

exports.among = stemmer.among
exports.except = stemmer.except

},{"./langs/english":5,"./stemmer":6}],5:[function(require,module,exports){
var stemmer = require('../stemmer')
  , alphabet = "abcdefghijklmnopqrstuvwxyz"
  , vowels = "aeiouy"
  , consonants = alphabet.replace(RegExp("[" + vowels + "]", "g"), "") + "Y"
  , v_wxy = vowels + "wxY"
  , valid_li = "cdeghkmnrt"
  , r1_re = RegExp("^.*?([" + vowels + "][^" + vowels + "]|$)")
  , r1_spec = /^(gener|commun|arsen)/
  , doubles = /(bb|dd|ff|gg|mm|nn|pp|rr|tt)$/
  , y_cons = RegExp("([" + vowels + "])y", "g")
  , y_suff = RegExp("(.[^" + vowels + "])[yY]$")
  , exceptions1 =
    { skis: "ski"
    , skies: "sky"
    , dying: "die"
    , lying: "lie"
    , tying: "tie"

    , idly: "idl"
    , gently: "gentl"
    , ugly: "ugli"
    , early: "earli"
    , only: "onli"
    , singly: "singl"

    , sky: "sky"
    , news: "news"
    , howe: "howe"
    
    , atlas: "atlas"
    , cosmos: "cosmos"
    , bias: "bias"
    , andes: "andes"
    }
  , exceptions2 =
    [ "inning", "outing", "canning", "herring", "earring"
    , "proceed", "exceed", "succeed"
    ]


module.exports = function(word) {
  // Exceptions 1
  var stop = stemmer.except(word, exceptions1)
  if (stop) return stop

  // No stemming for short words.
  if (word.length < 3) return word

  // Y = "y" as a consonant.
  if (word[0] === "y") word = "Y" + word.substr(1)
  word = word.replace(y_cons, "$1Y")

  // Identify the regions of the word.
  var r1, m
  if (m = r1_spec.exec(word)) {
    r1 = m[0].length
  } else {
    r1 = r1_re.exec(word)[0].length
  }

  var r2 = r1 + r1_re.exec(word.substr(r1))[0].length

  // Step 0
  word = word.replace(/^'/, "")
  word = word.replace(/'(s'?)?$/, "")

  // Step 1a
  word = stemmer.among(word,
    [ "sses", "ss"
    , "(ied|ies)", function(match, _, offset) {
        return (offset > 1) ? "i" : "ie"
      }
    , "([" + vowels + "].*?[^us])s", function(match, m1) { return m1 }
    ])

  stop = stemmer.except(word, exceptions2)
  if (stop) return stop

  // Step 1b
  word = stemmer.among(word,
    [ "(eed|eedly)", function(match, _, offset) {
        return (offset >= r1) ? "ee" : match + " "
      }
    , ("([" + vowels + "].*?)(ed|edly|ing|ingly)"), function(match, prefix, suffix, off) {
        if (/(?:at|bl|iz)$/.test(prefix)) {
          return prefix + "e"
        } else if (doubles.test(prefix)) {
          return prefix.substr(0, prefix.length - 1)
        } else if (shortv(word.substr(0, off + prefix.length)) && off + prefix.length <= r1) {
          return prefix + "e"
        } else {
          return prefix
        }
      }
    ])

  // Step 1c
  word = word.replace(y_suff, "$1i")

  // Step 2
  word = stemmer.among(word, r1,
    [ "(izer|ization)", "ize"
    , "(ational|ation|ator)", "ate"
    , "enci", "ence"
    , "anci", "ance"
    , "abli", "able"
    , "entli", "ent"
    , "tional", "tion"
    , "(alism|aliti|alli)", "al"
    , "fulness", "ful"
    , "(ousli|ousness)", "ous"
    , "(iveness|iviti)", "ive"
    , "(biliti|bli)", "ble"
    , "ogi", function(m, off) {
        return (word[off - 1] === "l") ? "og" : "ogi"
      }
    , "fulli", "ful"
    , "lessli", "less"
    , "li", function(m, off) {
        return ~valid_li.indexOf(word[off - 1]) ? "" : "li"
      }
    ])

  // Step 3
  word = stemmer.among(word, r1,
    [ "ational", "ate"
    , "tional", "tion"
    , "alize", "al"
    , "(icate|iciti|ical)", "ic"
    , "(ful|ness)", ""
    , "ative", function(m, off) {
        return (off >= r2) ? "" : "ative"
      }
    ])

  // Step 4
  word = stemmer.among(word, r2,
    [ "(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ism|ate|iti|ous|ive|ize)", ""
    , "ion", function(m, off) {
        return ~"st".indexOf(word[off - 1]) ? "" : m
      }
    ])

  // Step 5
  word = stemmer.among(word, r1,
    [ "e", function(m, off) {
        return (off >= r2 || !shortv(word, off - 2)) ? "" : "e"
      }
    , "l", function(m, off) {
        return (word[off - 1] === "l" && off >= r2) ? "" : "l"
      }
    ])

  word = word.replace(/Y/g, "y")

  return word
}


// Check for a short syllable at the given index.
// Examples:
//
//   rap
//   trap
//   entrap
//
// NOT short
//
//   uproot
//   bestow
//   disturb
//
function shortv(word, i) {
  if (i == null) i = word.length - 2
  if (word.length < 3) i = 0//return true
  return !!((!~vowels.indexOf(word[i - 1]) &&
              ~vowels.indexOf(word[i]) &&
             !~v_wxy.indexOf(word[i + 1]))
         || (i === 0 &&
              ~vowels.indexOf(word[i]) &&
             !~vowels.indexOf(word[i + 1])))
}

// Check if the word is short.
function short(word, r1) {
  var l = word.length
  return r1 >= l && shortv(word, l - 2)
}

},{"../stemmer":6}],6:[function(require,module,exports){
var stemmer = {}
  , cache = {}

module.exports = stemmer

stemmer.except = function(word, exceptions) {
  if (exceptions instanceof Array) {
    if (~exceptions.indexOf(word)) return word
  } else {
    for (var k in exceptions) {
      if (k === word) return exceptions[k]
    }
  }
  return false
}


// word - String
// offset - Integer (optional)
// replace - Key/Value Array of pattern, string, and function.
stemmer.among = function among(word, offset, replace) {
  if (replace == null) return among(word, 0, offset)

  // Store the intial value of the word.
  var initial = word.slice()
    , pattern, replacement

  for (var i = 0; i < replace.length; i+=2) {
    pattern = replace[i]
    pattern = cache[pattern] || (cache[pattern] = new RegExp(replace[i] + "$"))
    replacement = replace[i + 1]

    if (typeof replacement === "function") {
      word = word.replace(pattern, function(m) {
        var off = arguments["" + (arguments.length - 2)]
        if (off >= offset) {
          return replacement.apply(null, arguments)
        } else {
          return m + " "
        }
      })
    } else {
      word = word.replace(pattern, function(m) {
        var off = arguments["" + (arguments.length - 2)]
        return (off >= offset) ? replacement : m + " "
      })
    }

    if (word !== initial) break
  }

  return word.replace(/ /g, "")
}

},{}]},{},[3]);
