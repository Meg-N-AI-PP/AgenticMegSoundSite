# issue while check the phase 4 (round 1)
1. the chat UI is very ugly, make it bigger a little bit and more beautiful with modern style
2. the chat in portfolio page and music page are using the same chat and agent I think, but it should be 2 different chat UI style and different conversation
3. when I click to a project card in portfolio page, the agent not automatically give me some more detail on that project
4. the agent from portforlio page is not me (Meg), its should be an assistant agent who will answer questions for me, you can understand like a secretary
5. What is the retrive using in music page, is it RAG or vector search, and why it answer something that not in the database
6. When I select a music and play, the agent not understand what music is playing, all the user behavior need to be sent to the agent so that the agent know user is doing

# issue while check the phase 4 (round 2)
1. Issue 3 from previous still issue, when I click a project, its open the chat but the agent not send the project more details
2. The conversation for each page should keep, when I chat with the agent in profolio page, then go to music page and comeback to portforlio page, the chat refresh new, same for the music page, I need it to keep the conversation for each chat
3. Also for the agent in music page, if I type give me some phonk style, will it understand natural language search and what will it use to search, vector or query by genre or other field? for any user chat that about music they want to here, always do vector search

# issue and enhancement while check the phase 4 (round 3)
1. please remove the help and debug in the chat, aslo the copilotkit icon from top, I don't want to see it, please hide it if possible
2. the agent in portfolio also can suggest user for technical? why, its should act as a non technical secretary person who only based on Meg which is me experience, cv to answer user, not suggesting them any technical thing and solution, if they want that, the agent must tell please contact Meg on that.
3. the project click and agent answer is working, but when I click a project, it send a message like "Tell me more about Meg's "Document Approval Platform" project — what technologies were used and what did she accomplish?" to the agent automactically and then the agent answer, is it possible that don't need to send that message to agent, but the agent know that user click on which project and it send the information to user?
4. the chat agent in music page, I can type the text but can't see the text, when enter I see the text

# issue and enhancement while check the phase 4 (round 4)
1. you are using hard code data for my portfolio for the agent, now I want you to read the My CV.md file and Meg CV.pdf file if possible to get the knowledge of everything for my experience, and combine and update the portfolio page. Also the page should have a Resume download icon and user can download the Meg CV.pdf file. Also user can ask for download my resume in the chat and the agent will send that pdf file for download. Check if these possible and do it.