from unittest import result
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout, update_session_auth_hash 
from django.contrib.auth.forms import UserCreationForm, UserChangeForm, PasswordChangeForm
from django.contrib import messages 
from .forms import SignUpForm, EditProfileForm 
from django.templatetags.static import static
import PyPDF2
from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
from Sastrawi.StopWordRemover.StopWordRemoverFactory import StopWordRemoverFactory

# Module scrapping for syllabus
from .scrapping import filterAfterOneSentence, filterBetweenSentences

# Create your views here.
def home(request): 
	return render(request, 'authenticate/home.html', {})

def syllabus(request): 
	context = {'extracted_text' : ""}
	if request.method == 'POST':
		uploaded_file = request.FILES['document']
		# print("uploaded_file.name")
		# pdfFileObj = open(uploaded_file) 
		pdfReader = PyPDF2.PdfFileReader(uploaded_file) 
		# pageObj = pdfReader.pages[0]
		# extracted_text = pageObj.extractText()

		# Variables Setup
		isAirlangga = False			# Checks if the document is from Airlangga
		textRaw = ''				# Stores the raw text of the document
		title = ''				# Stores the title of the document
		content = {				# Stores the content of the document
			"goal": "",
			"description": "",
		}
  
		# Result is all the text in the PDF file.
		# print("--- [Text Raw]  ---")	# Prints the title of the section
		for page in pdfReader.pages:
			textRaw += page.extractText()
		# print(textRaw)				# Prints the raw text of the document
		# print(textRaw.splitlines())	# Prints the raw text of the document split into lines
   
		# Checks if the document is from Airlangga
		isAirlangga = textRaw.find("Universitas Airlangga") != -1
  
		# Filter the title of the syllabus
		title = filterAfterOneSentence(textRaw.splitlines(), "Universitas Airlangga" if isAirlangga else "Matakuliah")
  
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
  
		print("--- [Resume]  ---")
		print("Nama File :", uploaded_file.name)
		print("Jumlah Halaman :", str(pdfReader.numPages))
		print("Lembaga :", "Universitas Airlangga (UNAIR)" if isAirlangga else "Institut Teknologi Sepuluh Nopember (ITS)")
		print("Judul Silabus :", title)
  
		print("--- [Capaian]  ---")
		print(content["goal"])
  
		print("--- [Deskripsi]  ---")
		print(content["description"])
		print("-----------------\n")

		extracted_text = content["goal"] + ' ' + content["description"]

		parts = extracted_text.split(".")
		factory = StemmerFactory()
		stemmer = factory.create_stemmer()
		# factory2 = StopWordRemoverFactory()
		# stopwords = factory2.get_stop_words()
		factory2 = StopWordRemoverFactory()
		stopword = factory2.create_stop_word_remover()
		for index,part in enumerate(parts):
			parts[index] = stopword.remove(part)
			parts[index] = stemmer.stem(parts[index])
		print("\n--- [PARTS]  ---\n")
		print(parts)

		context = {'content' : extracted_text, 'extracted_text' : parts, 'title' : title, 'university' : "Universitas Airlangga (UNAIR)" if isAirlangga else "Institut Teknologi Sepuluh Nopember (ITS)"}
	return render(request, 'authenticate/syllabus.html', context)

def documentation(request): 
	return render(request, 'authenticate/documentation.html', {})

def dataset(request): 
	return render(request, 'authenticate/dataset.html', {})

def login_user (request):
	if request.method == 'POST': #if someone fills out form , Post it 
		username = request.POST['username']
		password = request.POST['password']
		user = authenticate(request, username=username, password=password)
		if user is not None:# if user exist
			login(request, user)
			messages.success(request,('Youre logged in'))
			return redirect('home') #routes to 'home' on successful login  
		else:
			messages.success(request,('Error logging in'))
			return redirect('login') #re routes to login page upon unsucessful login
	else:
		return render(request, 'authenticate/login.html', {})

def logout_user(request):
	logout(request)
	messages.success(request,('Youre now logged out'))
	return redirect('home')

def register_user(request):
	if request.method =='POST':
		form = SignUpForm(request.POST)
		if form.is_valid():
			form.save()
			username = form.cleaned_data['username']
			password = form.cleaned_data['password1']
			user = authenticate(username=username, password=password)
			login(request,user)
			messages.success(request, ('Youre now registered'))
			return redirect('home')
	else: 
		form = SignUpForm() 

	context = {'form': form}
	return render(request, 'authenticate/register.html', context)

def edit_profile(request):
	if request.method =='POST':
		form = EditProfileForm(request.POST, instance= request.user)
		if form.is_valid():
			form.save()
			messages.success(request, ('You have edited your profile'))
			return redirect('home')
	else: 		#passes in user information 
		form = EditProfileForm(instance= request.user) 

	context = {'form': form}
	return render(request, 'authenticate/edit_profile.html', context)
	#return render(request, 'authenticate/edit_profile.html',{})



def change_password(request):
	if request.method =='POST':
		form = PasswordChangeForm(data=request.POST, user= request.user)
		if form.is_valid():
			form.save()
			update_session_auth_hash(request, form.user)
			messages.success(request, ('You have edited your password'))
			return redirect('home')
	else: 		#passes in user information 
		form = PasswordChangeForm(user= request.user) 

	context = {'form': form}
	return render(request, 'authenticate/change_password.html', context)