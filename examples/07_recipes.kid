# Recipes are your own instructions
define greet(name):
  say "Hi " + name + "!"
end

define double(n):
  give back n * 2
end

define square(size):
  repeat 4 times:
    forward size
    turn right 90
  end
end

greet("Mira")
greet("Arjun")
say "Double 21 is " + double(21)
square(80)
square(40)
