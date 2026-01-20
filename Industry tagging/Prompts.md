


For Gemini

Write the exact prompt - nothhing more, nothing else - to give to Cursor for it to create an application exectuable in Cursor that will take in input an excell file that I am providing at the same time and tell it to add a column to that excel file that is filled up by requests to openai API with the industry of the companies defined in the existing columns in the excel file. The industry is to be selected in a list of industry label also provided in a joint image.
The OpenI API key is to be found in the file secrets.md
Do not give any specific technical details. But give high level directions like "Keep it as simple as possible simple, use top-of-the art practices, use the language the simpliest and most efficient to generate and run in Cursor"
Make sure there is live feedback on the progress of the operations 
Make sure the errors are properly handled and displayed in the output. Any critical error must interrupt the operations and displayed a clear error message and action to solve the problem


1) copy paste the answer by By Gemini inot cursor

Create an application that reads the file `Corporate accounts 2026.xlsx` and the attached image containing industry labels. The application should identify the companies in the spreadsheet, use the OpenAI API to determine their industry, and add a new column to the Excel file with this information.

High-level directions:

* **Constraint:** The industry for each company MUST be selected strictly from the list of labels provided in the attached image.
* **API Key:** Retrieve the OpenAI API key from the `secrets.md` file.
* **Development Standards:** Keep it as simple as possible, use top-of-the-art practices, and use the language that is simplest and most efficient to generate and run directly in Cursor.
* **Live Feedback:** Provide real-time feedback in the terminal/console on the progress of the operations (e.g., "Processing row X of Y").
* **Error Handling:** Ensure errors are properly handled and displayed. Any critical error must interrupt the operation and display a clear error message with a suggested action to solve the problem.
* **Output:** Save the results into a new file named `Corporate accounts 2026 updated.xlsx`.


2) ask cursor: run the application


----
Improvemnst for next one

1) process by batch of 50 lines to improve the performance and reduce the number of calls to openai apo

2) Connect to RH api
https://maas.apps.prod.rhoai.rh-aiservices-bu.com/