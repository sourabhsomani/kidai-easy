# Draw a flower with the drawing robot
set colors to ["red", "orange", "gold", "hotpink", "purple", "deepskyblue"]
pen size 4

for each petal_color in colors:
  color petal_color
  repeat 36 times:
    forward 6
    turn right 10
  end
  turn right 60
end

color "green"
pen size 6
turn right 180
forward 150
