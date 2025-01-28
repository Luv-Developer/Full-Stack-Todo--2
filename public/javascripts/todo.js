const btn = document.getElementById("add")
btn.addEventListener("click",()=>{
    const task = document.getElementById("task").value
    const div = document.createElement("div")
    const container = document.getElementById("container2")
    div.className = "box"
    div.textContent = `${task}`
    container.appendChild(div)
})