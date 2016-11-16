#Alexa Skills for Tesla (in Node.js)


An implementation in Node.js of the client side interface to the Tesla Model S API documented at: 

	http://docs.timdorr.apiary.io/

This is unofficial documentation of the Tesla Model S REST API used by the iOS and Android apps. It features functionality to monitor and control the Model S remotely. Documentation is provided on the Apiary.io site linked above.

#Installation

To use these programs you must download and install 'node' from http://nodejs.org
. Once node is installed, use the included 'npm' utility to download and install the teslams tools and all it's dependent modules

	npm install -g teslams
	
or if you are not logged in as the root (administrator) use:
	
	sudo npm install -g teslams

Need to install
- .bash_profile for env variables
- AWS cli tools
- Python and PIP
- Serverless for deployments
- Visual Studio (open source)
- teslams 
- alexa-sdk
- lambda-local  (https://developer.amazon.com/public/community/post/Tx24Z2QZP5RRTG1/New-Alexa-Technical-Tutorial-Debugging-AWS-Lambda-Code-Locally
)  npm install -g lambda-local
- geocoder
- google-matrix 
- dotenv (for credentials and home location)
- need to setup AWS account, and alexa SDK account


#deployments

I use serverless.  So you need to install it.  Then update the serverless.yml file

		service: alexaSkills

		provider:
		name: aws
		runtime: nodejs4.3
		profile: production
		memorySize: 512
		region: us-east-1
		stage: dev


		# you can add packaging information here
		package:
		exclude: speechAssets, functions, speechAssets, tests
		#  artifact: my-service-code.zip

		functions:
		tesla:
			handler: index.handle
			description: "Tesla Skills Application (serverless deployment)"
			timeout: 5

