const { Router } = require("express");
const Order = require("../models/order");
const auth = require("../middleware/auth");

const router = Router();

router.get("/", auth, async (req, res) => {
  try {
    const orders = await Order.find({
      "user.userId": req.user._id,
    }).populate("user.userId");

    //console.log(orders);
    res.render("order", {
      title: "Order",
      isOrder: true,
      orders: orders.map((o) => ({
        courses: o.courses.map((c) => ({
          title: c.course.title,
          count: c.count,
        })),
        _id: o._id.toString(),
        user: { name: o.user.name, email: o.user.userId.email },
        date: o.date,
        price: o.courses.reduce(
          (total, c) => total + c.count * c.course.price,
          0
        ),
      })),
    });
  } catch (e) {
    console.log(e);
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const user = await req.user.populate("cart.items.courseId");
    //console.log(user.cart.items);
    const courses = user.cart.items.map((i) => {
      return {
        count: i.count,
        course: {
          title: i.courseId.title,
          price: i.courseId.price,
          img: i.courseId.img,
          id: i.courseId._id,
        },
      };
    });

    const order = new Order({
      user: {
        name: req.user.name,
        userId: req.user,
      },
      courses,
    });

    await order.save();
    await req.user.clearCart();

    res.redirect("/order");
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
