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
<img src="https://user-images.githubusercontent.com/87128274/174702911-ddf2c7f2-5487-4d01-9f0c-0d9ff318f57d.jpg" width="800"/>
User starts with inputting syllabus documents from Unair and ITS then the application will process the documents to generate the results. The process includes scrapping, regular expression, pre-processing, topic modelling, and making both the word cloud and word list.

## Input
<img src="https://user-images.githubusercontent.com/87128274/174703317-4902d6e4-9026-4ddb-95fd-3fbd9f4abee0.jpg" height="500"/> <img src="https://user-images.githubusercontent.com/87128274/174703323-d5e25a4f-4583-4164-a1f3-12f9a3ecbf8a.jpg" height="500"/>

These are examples of Information Systems syllabuses from both universities. Please note that this application only accept current structure of these syllabuses.

## Dataset
<img src="https://user-images.githubusercontent.com/87128274/174703374-35212524-dd87-49a1-8043-38d3f9c6bcbf.png" width="600"/>

This application provide some dataset examples consisting of some Information Systems subjects from each universities. These can be found in the 'Dataset' tab.

## Output
<img src="https://user-images.githubusercontent.com/87128274/174703408-26a81ee2-ac81-4e1e-a336-9dce856dd0ad.jpg" height="250"/> <img src="https://user-images.githubusercontent.com/87128274/174703422-1dd7c8b5-0dbe-4b0e-be90-5959c74e6e6c.jpg" height="250"/>
<img src="https://user-images.githubusercontent.com/87128274/174703429-0010dd1c-beb4-4c3a-99d6-95547765e005.jpg" width="600"/>

This application will generate three outputs, from each universities and combined result. The output consist of overviews, word clouds, and word lists.


# How to Use
1. Upload the syllabus documents with .pdf format
<img src="https://user-images.githubusercontent.com/87128274/174691975-f15f5c4b-d389-4bbc-a5be-1bb73462fb87.jpg" width="600"/>
2. Submit the files

![Untitled (1)](https://user-images.githubusercontent.com/87128274/170993163-43a9768e-99e7-4307-b558-e5eb74906826.jpg)

3. SDE will generate two topic modelling result, from each syllabuses and from both syllabuses combined. The result consist of overviews, word clouds, and word lists.


# Limitation
1. The Syllabus Data Extraction application can only process the syllabus from Universitas Airlangga and Institut Teknologi Sepuluh November, specifically for the Information Systems Study Program because the scrapping and regular expression methods are created for only both syllabus.
2. The application only accepts syllabus in .pdf format as input.
3. The user has to input each one, not more nor less, Unair and ITS syllabus at the same time (the system will show a recommendation to input the same subject for both syllabuses). This step is important so that the application can generate maximal results for the user.
4. The application can only handle the current structure of both syllabuses. Further updates on the format and structure of the document require improvement in the scrapping and regular expression methods.
5. The result of the topic modeling consists of a word cloud and word list.
6. The result will show one topic for each Unair and ITS syllabuses, and the combined syllabuses.
7. Generated word list contains 10 words from each syllabuses.


# Our Works
You can see our works regarding this project on:
### Google Docs Paper
https://docs.google.com/document/d/1-UAMIWk_p9pDrvQrgv7pen5Pjfx8Se5YazVdKwgV_gA/edit?usp=sharing

### Figma Project
https://www.figma.com/file/OxX7X5bEii3yr0IpPe4zaZ/Syllabus-Data-Extraction?node-id=0%3A1

### Notion
https://www.notion.so/72aa17742da34a119b76eb4b4760c238?v=490acbaeab944736917bb88570c45b08
