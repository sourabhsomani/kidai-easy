# Buttons make things happen when you click them
set score to 0
say "Click the buttons!"

when clicked "Jump":
  change score by 1
  say "Boing! Score: " + score
end

when clicked "Draw a star":
  color "gold"
  repeat 5 times:
    forward 100
    turn right 144
  end
end
