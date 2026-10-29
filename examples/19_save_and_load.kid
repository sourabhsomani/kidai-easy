# save keeps something even after you close the page
load "best" into best
if best is nothing:
  set best to 0
end
set score to random 1 to 100
say "You scored " + score + ". Best so far: " + best
if score > best:
  save score as "best"
  say "New high score!"
  play sound "win"
end
