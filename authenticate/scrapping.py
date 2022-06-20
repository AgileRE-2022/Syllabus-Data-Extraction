# Module to scrap the data from the syllabus document
import re, os, PyPDF2, pprint
from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
from Sastrawi.StopWordRemover.StopWordRemoverFactory import StopWordRemoverFactory

def filterAfterOneSentence(text, words: str):
    for index, line in enumerate(text):
        if line.find(words) != -1:
            for i in range(index + 1, len(text)):
                if text[i].strip():
                    return text[i].strip()

def filterBetweenSentences(text, start: str, end: str, bomb: int = 1):
    result = ""
    for index, line in enumerate(text):
        if line.find(start) != -1:
            for i in range(index + bomb, len(text)):
                if text[i].find(end) != -1:
                    break
                elif bomb == 4 and text[i] == "Cap" and text[i+1] == "aian Pembelajaran Matakuliah":
                    break
                elif text[i].strip():
                    if text[i][0].isupper() and len(result) > 0:
                        result += "\n" + text[i].strip()
                    else :
                        if text[i].strip() == '.':
                            result += '.'
                        elif len(result) > 0 and result[-1].isalpha() :
                            result += ' ' + text[i].strip()
                        else :
                            result += text[i].strip()
            return result if bomb == 4 else re.sub(r'\s+', ' ', result)
        
def scrapDocument(uploadedFile, segment: str, isDebugging: bool = False):
    # Variables Setup
    isAirlangga = False			# Checks if the document is from Airlangga
    textRaw = ''				# Stores the raw text of the document
    title = ''					# Stores the title of the document
    content = {					# Stores the content of the document
        "goal": "",
        "description": "",
    }
    extractedText = ""          # Stores the extracted text of the document
    debuggingSettings = {		# Stores the debugging settings => 
        "printDescription": True,
        "printExtractedText": True,
        "printGoal": True,
        "printRawText": False,
        "printResumedFile": True,
    }
    
    # Read the uploaded file
    pdfReader = PyPDF2.PdfFileReader(uploadedFile)
    for page in pdfReader.pages:
        textRaw += page.extractText()
        
    # Checks if the document is from Airlangga
    isAirlangga = textRaw.find("Universitas Airlangga") != -1
    
    # Filter the title of the syllabus
    if (isAirlangga):
        title = filterBetweenSentences(
            text = textRaw.splitlines(),
            start = "Universitas Airlangga",
            end = "Semester",
        )
    else:
        title = filterAfterOneSentence(
            text = textRaw.splitlines(),
            words = "Matakuliah",
        )
    
    # Filter the goal of the syllabus
    content["goal"] = filterBetweenSentences(
        text = textRaw.splitlines(),
        start = "Capaian Pembelajaran",
        end = "Deskripsi Mata" if isAirlangga else "Capaian Pembelajaran Matakuliah",
        bomb = 1 if isAirlangga else 4,
    )
    
    # Filter the description of the syllabus
    content["description"] = filterBetweenSentences(
        text = textRaw.splitlines(),
        start = "Deskripsi",
        end = "Atribut" if isAirlangga else "Capaian Pembelajaran",
        bomb = 2,
    )
    
    # Stemming and Stopword Removal
    stemmer = StemmerFactory().create_stemmer()                                 # Create a stemmer
    stopword = StopWordRemoverFactory().create_stop_word_remover()              # Create Stopword Remover
    extractedText = (content["goal"] + " " + content["description"]).split('.') # Split the text into sentences
    for index, sentence in enumerate(extractedText):
        extractedText[index] = stopword.remove(stemmer.stem(sentence))          # Stemming and Stopword Removal
        extractedText[index] = re.sub(r'\d+', ' ', extractedText[index])        # Number Removal
    
    # Print the result (Debugging) 
    if (isDebugging):
        widthPrint = os.get_terminal_size().columns if False else 80
        pp = pprint.PrettyPrinter(width=widthPrint, compact=True)
        
        if (debuggingSettings["printResumedFile"]):
            print("\n" + ("[Resume: " + segment + "]").center(widthPrint, '-'))
            print("Nama File:", uploadedFile.name)
            print("Jumlah Halaman:", str(pdfReader.numPages))
            print("Lembaga:", "Universitas Airlangga (UNAIR)" if isAirlangga else "Institut Teknologi Sepuluh Nopember (ITS)")
            print("Judul Silabus:", title, "\n")  
        
        if (debuggingSettings["printGoal"]):
            print(("[Capaian: " + segment + "]").center(widthPrint, '-'), )
            pp.pprint(content["goal"])
        
        if (debuggingSettings["printDescription"]):
            print("\n" + ("[Deskripsi: " + segment + "]").center(widthPrint, '-'))
            pp.pprint(content["description"])
        
        if (debuggingSettings["printExtractedText"]):
            print("\n" + ("[Ekstrasi Teks: " + segment + "]").center(widthPrint, '-'))
            pp.pprint(extractedText)
        
        if (debuggingSettings["printRawText"]):
            print("\n" + ("[Teks Mentah: " + segment + "]").center(widthPrint, '-'))
            pp.pprint(textRaw)
    
    # Return the result
    context = {
        'title': title,
        'university': "Universitas Airlangga (UNAIR)" if isAirlangga else "Institut Teknologi Sepuluh Nopember (ITS)",
        'content': content["goal"] + " " + content["description"],
        'extracted_text': extractedText,
    }
    return context