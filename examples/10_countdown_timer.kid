# "every" runs a block again and again on a timer
set seconds to 10
background "lightyellow"
hide
make sprite "timer" as seconds at 0, 0 size 140

every 1 second:
  change seconds by -1
  make sprite "timer" as seconds
  beep
  if seconds is 0:
    play sound "win"
    say "Time's up!"
    stop everything
  end
end
