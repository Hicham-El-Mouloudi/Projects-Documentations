function openDoc(projectId) {
  const links = {
    project1: "documentations/Library Manager/index.html"
  };

  const url = links[projectId];
  if (url) {
    window.location.href = url;
  } else {
    alert("This documentation is not yet available.");
  }
}
