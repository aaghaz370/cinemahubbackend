📋 OPTION 1: Password Change (When Logged In)
Agar tum logged in ho:

Go to Admin Panel → Profile/Settings
Use "Change Password" option
Enter current + new password
Done!
🔐 OPTION 2: Password Reset (Bhul Gaye)
Agar password bhul gaye:

Step 1: Open terminal in CINEMAHUB_BACKEND folder
Step 2: Run command:
bash
node reset-admin.js
Step 3: Script will show all admin users:
📋 Existing Admin Users:
   1. youremail@gmail.com
      Name: Your Name
      Role: superadmin
Step 4: Enter your email and new password:
📧 Enter the email of user to reset: youremail@gmail.com
🔑 Enter NEW password: newpassword123
🔑 Confirm NEW password: newpassword123
Step 5: Done! Use new password to login ✅
📧 OPTION 3: Email Change
Agar email change karna hai:

Step 1: Open terminal in CINEMAHUB_BACKEND folder
Step 2: Run command:
bash
node update-admin.js
Step 3: Follow prompts to change email/name