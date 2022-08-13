const { Router } = require("express");

const router = Router();
const Course = require("../models/course");
const auth = require("../middleware/auth");
const { courseValidators } = require("../utils/validators");
const { validationResult } = require("express-validator");

const isOwner = (course, user) => {
  return user && user._id.toString() === course.userId.toString();
};

router.get("/", async (req, res) => {
  try {
    let courses = await Course.find()
      .populate("userId", "name email")
      .select("title price img");
    //console.log(courses);
    courses = courses.map((c) => {
      return {
        title: c.title,
        price: c.price,
        img: c.img,
        id: c._id,
        userId: c.userId._id.toString(),
      };
    });

    res.render("courses", {
      title: "Courses",
      userId: req.user ? req.user._id.toString() : null,
      isCourses: true,
      courses,
    });
  } catch (e) {
    console.log(e);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    console.log(course, req.params.id);
    res.render("course", {
      title: `Course ${course.title}`,
      course: {
        title: course.title,
        price: course.price,
        img: course.img,
        id: course._id,
      },
      layout: "empty",
    });
  } catch (e) {
    console.log(e);
  }
});

router.get("/:id/edit", auth, async (req, res) => {
  if (!req.query.allow) return res.redirect("/");

  try {
    const course = await Course.findById(req.params.id);

    if (!isOwner(course, req.user)) {
      return res.redirect("/");
    }

    res.render("course-edit", {
      title: `Edit ${course.title}`,
      error: req.flash("error"),
      course: {
        title: course.title,
        price: course.price,
        img: course.img,
        id: course._id,
      },
    });
  } catch (e) {
    console.log(e);
  }
});

router.post("/edit", auth, courseValidators, async (req, res) => {
  const errors = validationResult(req);
  const { id } = req.body;

  if (!errors.isEmpty()) {
    req.flash("error", errors.array()[0].msg);
    return res.redirect(`/courses/${id}/edit?allow=true`);
  }

  delete req.body.id;

  try {
    const course = await Course.findById(id);

    if (!isOwner(course, req.user)) {
      return res.redirect("/");
    }

    Object.assign(course, req.body);
    await course.save();
    res.redirect("/courses");
  } catch (e) {
    consol.log(e);
  }
});

router.post("/remove", async (req, res) => {
  try {
    await Course.deleteOne({ _id: req.body.id, userId: req.user._id });
    res.redirect("/courses");
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
