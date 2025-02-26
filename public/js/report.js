const { jsPDF } = window.jspdf;

function downloadPdf() {
    html2canvas(document.querySelector('.report'))
    .then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'pt', 'a4');

        // Calculate the image width and height to fit in the PDF
        const imgWidth = 595.28; // A4 width in points
        const imgHeight = canvas.height * imgWidth / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save('report.pdf');
    });
};
