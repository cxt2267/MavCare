# Welcome to MavCare!
An inventory tracking/management system for hospital equipment. <br>
Utilizes RFID scanning technology to keep track of items and locations as well as user verification. 

## Features
- There is a default mode for regular users and an administrative mode for admins.
- Admins are automatically logged into admin mode.
- Users can register/login with their credentials or scan their key card to gain access.
- Users can also:
  - View a complete list of the items/equipment in the system along with their status, location, and most recent user.
  - Check in available items to be used.
  - Check out items when they are done using them.
  - Set items clean so the items can be checked in by other users.
  - View usage activity (see who used an item and when and where it was used).
  - View the items they currently have checked in.
  - View their own usage activity.
- Admins can:
  - Add and delete items, users, and locations (rooms).
  - View administrative activity.
- RFID scanning used for:
  - Checking items in and out and setting them clean.
  - Adding new items and rooms.
  - Deleting items.
    
## Frameworks and Tools
- Main Languages: JavaScript (frontend) & Java (backend).
- React with React-Bootstrap used to develop the main web/user interface.
- MySQL database used to keep track of users, inventory, locations, and logging.
- Jakarta RESTful Web Services used to develop a REST API for communicating with the database and retrieving info from the RFID reader.

## How to Run
**Requires the Vulcan Iron RFID reader for scanning functionality.**
**All other functionality should run fine without the reader.**
- Download the repository.
- Plug the Vulcan Iron RFID Reader into a USB port on a Windows PC or laptop.
 #### Setting up the Java Rest API
- Set up the server to deploy the REST API:
  - Go to [tomcat.apache.org](https://tomcat.apache.org/) and press 'Download' for Tomcat version 10 or later.
  - Download the binary distribution for your system and extract the zip file.
  - In the extracted folder, go to the 'bin' directory and run the 'startup' script to start running the Tomcat server.
  - Exit the 'bin' directory and go to the 'webapps' directory where you will add the JavaAPI.war file.
  - The API should be ready to go.
#### Running the Web Application
- Open the repository in Visual Studio or your preferred IDE.
- Node dependencies should automatically install.
- Run 'npm start' to start the development server (should be on [http://localhost:3000](http://localhost:3000)) and navigate to it.
- The application should now be open and running.
  
## Note 
- Mainly a proof-of-concept demonstration. Has not actually been implemented at a hospital. 
- If the application was being implemented, I would deploy both the Java REST API and React application on the hospital's local area network so they could be accessed without additional setup/configuration. 
- I would also include more manual (non-scanning) methods of checking items in and out and setting them clean, just in case their RFID tags are not functional.

[Vulcan Iron Reader](https://www.atlasrfidstore.com/vulcan-rfid-iron-usb-reader/)
