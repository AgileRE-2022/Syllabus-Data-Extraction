# Welcome to Syllabus-Data-Extraction!

# Overview
Syllabus Data Extractor (SDE) is an application to extract education data from syllabus document to retrieve information about related subject and major.

# How to Install
1. Make sure Django is installed. You can see the documentation on: https://docs.djangoproject.com/en/4.0/
2. Clone SDE Github repository from: https://github.com/AgileRE-2022/Syllabus-Data-Extraction
3. Install PyPDF2 dan Sastrawi dependencies with the command `python pip install PyPDF2 Sastrawi` or check the documentation on: https://pypi.org/project/PyPDF2/ ; https://pypi.org/project/Sastrawi/
4. Run the following command to run the application: `python manage.py runserver`.
```
Syllabus-Data-Extraction > python manage.py runserver
```


# How it Works
![IMG-20220621-WA0002](https://user-images.githubusercontent.com/87128274/174702911-ddf2c7f2-5487-4d01-9f0c-0d9ff318f57d.jpg)

## Input
asf
## Dataset
asd
## Output
asd


# How to Use
1. Upload the syllabus documents with .pdf format
<img src="https://user-images.githubusercontent.com/87128274/174691975-f15f5c4b-d389-4bbc-a5be-1bb73462fb87.jpg" width="500"/>
2. Submit the files

![Untitled (1)](https://user-images.githubusercontent.com/87128274/170993163-43a9768e-99e7-4307-b558-e5eb74906826.jpg)

3. SDE will generate two topic modelling result, from each syllabuses and from both syllabuses combined. The result consist of overviews, word clouds, and word lists.


# Limitation
1. The Syllabus Data Extraction application can only process the syllabus from Universitas Airlangga and Institut Teknologi Sepuluh November, specifically for the Information Systems Study Program because the scrapping and regular expression methods are created for only both syllabus
2. The application only accept syllabus in .pdf format as the input
3. User has to input each one, not more nor less, Unair and ITS syllabus at the same time (the system will show a recommendation to input the same subject for both syllabuses). This step is important so that the application can generate maximal results for user.
4. The application can only handle current structure of both syllabuses. Further update on the documents format and structure require improvement on the scrapping and regular expression methods.
5. The result of the topic modelling consist of word cloud and word list.
6. The result will show one topic for each Unair and ITS syllabuses, and the combined syllabuses.
7. Generated word list contain 10 words from each syllabuses.


# Our Works
You can see our works regarding this project on:
### Google Docs Paper
https://docs.google.com/document/d/1-UAMIWk_p9pDrvQrgv7pen5Pjfx8Se5YazVdKwgV_gA/edit?usp=sharing

### Figma Project
https://www.figma.com/file/OxX7X5bEii3yr0IpPe4zaZ/Syllabus-Data-Extraction?node-id=0%3A1

### Notion
https://www.notion.so/72aa17742da34a119b76eb4b4760c238?v=490acbaeab944736917bb88570c45b08
