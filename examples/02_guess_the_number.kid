# Guess the number game
set secret to random 1 to 20
set tries to 0
set guess_number to 0
say "I am thinking of a number from 1 to 20."

repeat until guess_number is secret:
  ask "Your guess?" into guess_number
  change tries by 1
  if guess_number is bigger than secret:
    say "Too big!"
  else if guess_number is smaller than secret:
    say "Too small!"
  end
end

say "You got it in " + tries + " tries!"
