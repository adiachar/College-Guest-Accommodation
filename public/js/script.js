let request = document.querySelectorAll(".req-head");

for(req of request)
{   
    let clickedOnce = false;
    req.addEventListener('click', (event)=>{
        if(clickedOnce){
            requestDetails = event.target.parentElement.parentElement.children[2];
            requestDetails.style.height="0vh";
            clickedOnce = false;
        }
        else{
            requestDetails = event.target.parentElement.parentElement.children[2];
            requestDetails.style.display="inline-block";
            requestDetails.style.maxHeight="100vh";
            clickedOnce = true;
        }
        
    });
}