const containsLesson = (obj, list) => {
  for (let i = 0; i < list.length; i++) {
    if (list[i].lessonID !== undefined) {
      if (list[i].lessonID == obj.lessonID) {
        return true;
      } else if (list[i].lessonID == obj._id) {
        return true;
      }
    }
    if (list[i]._id !== undefined) {
      if (list[i]._id == obj.lessonID) {
        return true;
      }
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
};

const redirectIfNotAdmin = async (req, res) => {
  const loggedUser = await getCurrentUser(req);
  if (!req.isAuthenticated() || loggedUser.role !== "admin") {
    res.redirect("/login");
    return true;
  }
};

module.exports = { redirectIfNotAdmin, redirectIfNotAuthenticated, getCurrentUser, getCurrentDate, containsLesson };
