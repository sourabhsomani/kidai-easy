# Draw with your keyboard! Click the stage first.
pen size 4
say "Arrows move Sparky. Press c to change colour, space for a dot."
set colors to ["red", "orange", "gold", "green", "deepskyblue", "purple"]
set i to 1

when key "up" pressed:
  forward 15
end
when key "down" pressed:
  back 15
end
when key "left" pressed:
  turn left 30
end
when key "right" pressed:
  turn right 30
end
when key "space" pressed:
  dot 10
end
when key "c" pressed:
  set i to i mod 6 + 1
  color item i of colors
  play sound "pop"
end
