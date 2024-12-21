let rejectedBtn = document.querySelectorAll('.btn-rejected');

for(btn of rejectedBtn){
    btn.addEventListener('click', (event)=> {
        console.log(event.target);
    });

}

