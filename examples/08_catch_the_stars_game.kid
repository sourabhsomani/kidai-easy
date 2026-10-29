# Catch the falling stars!
# Click the stage, then use the left and right arrow keys.
background "midnightblue"
hide
make sprite "basket" as "🧺" at 0, -170 size 60
make sprite "star" as "⭐" at 0, 200 size 40
make sprite "score" as "Score: 0" at -130, 175
set score to 0
set speed to 4

repeat forever:
  if key "left" is pressed:
    move sprite "basket" by -8, 0
  end
  if key "right" is pressed:
    move sprite "basket" by 8, 0
  end
  move sprite "star" by 0, -speed
  if "star" touches "basket":
    change score by 1
    change speed by 0.5
    play sound "coin"
    make sprite "score" as "Score: " + score
    move sprite "star" to random -180 to 180, 200
  end
  if y of sprite "star" < -200:
    play sound "lose"
    say "Game over! You caught " + score + " stars."
    stop
  end
  wait 0.03
end
