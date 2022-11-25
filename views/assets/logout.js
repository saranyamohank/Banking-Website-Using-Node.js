const  logout =()=>{
    localStorage.removeItem("username")
    localStorage.removeItem('token')
    window.location.replace('/login')
}
