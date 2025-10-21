// assets/asset.js
import logo from "./logo.png"
import cart from "./cart.png"
import biryani from "./biryani.jpg"
import burger from "./burger.jpg"
import cakes from "./cakes.jpg"
import icecreame from "./icecreame.jpg"
import pizza from "./pizza.jpg"
import rolls from "./rolls.jpg"
import salad from "./salad.jpg"
import video from "./video.mp4"
import profile from "./profile.png"
import upload from "./images.png"
export const asset= {
    logo, 
    cart,
    profile,
    video,
    upload
}

export const categories = [
    {
        category:'biryani', // CHANGED 'name' TO 'category'
        icon:biryani
    },
    {
        category:'burger', // CHANGED 'name' TO 'category'
        icon:burger
    },
    {
        category:'cakes', // CHANGED 'name' TO 'category'
        icon:cakes
    },
    {
        category:'icecreame', // CHANGED 'name' TO 'category'
        icon:icecreame
    },
    {
        category:'pizza', // CHANGED 'name' TO 'category'
        icon:pizza
    },
    {
        category:'rolls', // CHANGED 'name' TO 'category'
        icon:rolls
    },
    {
        category:'salad', // CHANGED 'name' TO 'category'
        icon:salad
    }
]