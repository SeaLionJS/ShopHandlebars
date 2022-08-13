const { Router } = require("express");
const Course = require("../models/course");
const auth = require("../middleware/auth");
const router = Router();

function mapCartItems(cart) {
  return cart.items.map((c) => {
    return {
      id: c.courseId._id,
      title: c.courseId.title,
      price: c.courseId.price,
      img: c.courseId.img,
      count: c.count,
    };
  });
}

function computePrice(courses) {
  return courses.reduce((total, c) => {
    return (total += c.price * c.count);
  }, 0);
}

router.post("/add", auth, async (req, res) => {
  console.log("req.body._csrf", req.body._csrf);
  const course = await Course.findById(req.body.id);
  await req.user.addToCart(course);
  res.redirect("/cart");
});

router.get("/", auth, async (req, res) => {
  const user = await req.user.populate("cart.items.courseId");

  const courses = mapCartItems(user.cart);

  res.render("cart", {
    title: "Cart",
    courses,
    price: computePrice(courses),
    isCard: true,
  });
});

router.delete("/remove/:id", auth, async (req, res) => {
  const user = await req.user.populate("cart.items.courseId");
  await user.removeFromCart(req.params.id);
  const courses = mapCartItems(user.cart);
  const cart = { courses, price: computePrice(courses) };
  res.status(200).json(cart);
});

module.exports = router;
