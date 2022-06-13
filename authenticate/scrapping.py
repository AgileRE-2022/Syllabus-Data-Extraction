# Module to scrap the data from the syllabus document
import re

def filterAfterOneSentence(text, words):
    for index, line in enumerate(text):
        if line.find(words) != -1:
            for i in range(index + 1, len(text)):
                if text[i].strip():
                    return text[i].strip()

def filterBetweenSentences(text, start, end, bomb):
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