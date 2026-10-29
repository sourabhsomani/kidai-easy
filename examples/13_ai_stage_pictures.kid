# Sparky draws shapes, takes a picture of each, and learns from them
define take_picture_of_circle(size):
  clear
  go home
  circle size
  give back stage picture
end

define take_picture_of_square(size):
  clear
  go to 0 - size / 2, 0 - size / 2
  repeat 4 times:
    forward size
    turn right 90
  end
  give back stage picture
end

teach "circle" with [take_picture_of_circle(40), take_picture_of_circle(90)]
teach "square" with [take_picture_of_square(60), take_picture_of_square(150)]

say "Test on new sizes:"
test "circle" with [take_picture_of_circle(60), take_picture_of_circle(120)]
test "square" with [take_picture_of_square(100), take_picture_of_square(40)]
say "Accuracy on the last test: " + how accurate + "%"
