

document.addEventListener('DOMContentLoaded', function() {
  
  function setActiveButton(activeId) {
      // Remove 'active' class from all buttons
      document.querySelectorAll(".navbar .btn").forEach(button => {
          button.classList.remove("active");
      });

      // Add 'active' class to the clicked button
      document.getElementById(activeId).classList.add("active");
  }

  // Use buttons to toggle between views and set active state
  document.querySelector('#inbox').addEventListener('click', () => {
      load_mailbox('inbox');
      setActiveButton('inbox');
  });

  document.querySelector('#sent').addEventListener('click', () => {
      load_mailbox('sent');
      setActiveButton('sent');
  });

  document.querySelector('#archived').addEventListener('click', () => {
      load_mailbox('archive');
      setActiveButton('archived');
  });

  document.querySelector('#compose').addEventListener('click', () => {
      compose_email();
      setActiveButton('compose');
  });
  document.querySelector('#compose-form').addEventListener('submit', send_email);

  // By default, load the inbox and highlight Inbox button
  load_mailbox('inbox');
  setActiveButton('inbox');
});


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-detail-view').style.display = 'none';


  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}
function view_email(id){
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'none';
      document.querySelector('#email-detail-view').style.display = 'block';
      document.querySelector('#email-detail-view').innerHTML=` 
      <ul class="list-group">
        <li class="list-group-item"><strong>From:</strong> ${email.sender}</li>
        <li class="list-group-item"><strong>To:</strong> ${email.recipients}</li>
        <li class="list-group-item"><strong>Subject:</strong> ${email.subject}</li>
        <li class="list-group-item"><strong>Timestamp:</strong> ${email.timestamp}</li>
        <li class="list-group-item">${email.body}</li>
      </ul>
      `

      // change to read 
      if (!email.read){
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
              read: true
          })
        })
      }
      // add archive logic
      const btn_arch = document.createElement('button');
      btn_arch.innerHTML = email.archived ? "Unarchived":"Archived";
      btn_arch.className = email.archived ? "btn btn-success": "btn btn-danger";
      btn_arch.addEventListener('click', function() {
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
              archived: !email.archived
          })
        })
        .then(()=> {load_mailbox('archive')})
      });
      document.querySelector('#email-detail-view').append(btn_arch);   
      //reply logic 
      const btn_reply = document.createElement('button');
      btn_reply.innerHTML = "Reply";
      btn_reply.className = "btn btn-info ";
      btn_reply.addEventListener('click', function() {
        compose_email();
        document.querySelector('#compose-recipients').value = email.sender;
        let subject=email.subject;
        if (!subject.startsWith("Re: ")) {
          subject = "Re: " + email.subject;
      }
        document.querySelector('#compose-subject').value = subject;
        document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
        
      });
      
      document.querySelector('#email-detail-view').append(btn_reply);   


});
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-detail-view').style.display = 'none';


  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // loop for email and create div 
emails.forEach(singleEmail => {

console.log(singleEmail);

// Create a new div for the email item
const newEmail = document.createElement('div');
newEmail.className = "list-group-item";  // Apply the class for the email item styling

// Set the inner HTML content for the email
newEmail.innerHTML = `
  <div class="email-content">
    <span class="sender">${singleEmail.sender}</span>
    <span class="subject">${singleEmail.subject}</span>
    <span class="timestamp">${singleEmail.timestamp}</span>
  </div>
`;

// Assuming there’s a container where you want to add the new email
const emailContainer = document.getElementById('emails-view'); // Replace with your actual container ID
emailContainer.appendChild(newEmail);  // Add the new email to the container

    // change background color
    newEmail.className = singleEmail.read? 'read':'unread';

    newEmail.addEventListener('click', function(){
      view_email(singleEmail.id);

    });

    document.querySelector('#emails-view').append(newEmail);
        

      });
      console.log(emails);
  
      // ... do something else with emails ...
  });
}


function send_email(event){
  event.preventDefault();

  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;


  // send data to backend
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      
      console.log(result);
      load_mailbox('sent');
  });
  

}
