/*!
 * Copyright (C) 2025 Sabine Hollmann
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License, Version 3,
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * For the full GPL-3.0 license, see: https://www.gnu.org/licenses/gpl-3.0.html
 */

// ---------------------Website-Setup--------------------------

let BTTButton = document.getElementById("bttButton");

// When scrolled down 20px from the top of the document, show the button
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    BTTButton.style.display = "block";
  } else {
    BTTButton.style.display = "none";
  }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}
