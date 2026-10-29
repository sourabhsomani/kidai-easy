# Times table and lists
set number to 7
set count to 1
repeat 10 times:
  say number + " x " + count + " = " + number * count
  change count by 1
end

set fruits to ["apple", "banana", "mango"]
add "kiwi" to fruits
for each fruit in fruits:
  say "I like " + fruit
end
say "I have " + length of fruits + " fruits."
say "The first one is " + item 1 of fruits
