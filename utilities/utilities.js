const containsLesson = (obj, list) => {
    for (let i = 0; i < list.length; i++) {
      if ((list[i].languageLevel === obj.languageLevel && list[i].languageLevelSubject === obj.languageLevelSubject && list[i].title === obj.title) || (list[i].languageLevel === obj.languageLevel && list[i].subject === obj.languageLevelSubject && list[i].title === obj.title)) {
        return true;
      }
    }
    return false;
  };
  
  const getCurrentDate = () => {
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, "0");
    let mm = String(today.getMonth() + 1).padStart(2, "0");
    let yyyy = today.getFullYear();
  
    today = dd + "/" + mm + "/" + yyyy;
    return today;
  };
  
  const getCurrentUser = async (req) => {
    if (!req.user) return null;
  
    return req.user;
  };
  
  const redirectIfNotAuthenticated = (req, res) => {
    if (!req.isAuthenticated()) {
      res.redirect("/login");
      return true;
    }
  }
  
  const redirectIfNotAdmin = async(req, res) => {
    const loggedUser = await getCurrentUser(req);
    if (!req.isAuthenticated() || loggedUser.role !== 'admin') {
      res.redirect("/login");
      return true;
    }
  }

  module.exports = {redirectIfNotAdmin, redirectIfNotAuthenticated, getCurrentUser, getCurrentDate, containsLesson}