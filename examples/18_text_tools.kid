# Splitting, joining and replacing words
set sentence to "I like red and blue and green"
set colours to split "red,blue,green" by ","
say colours
say join colours with " + "
say replace "like" with "love" in sentence
if sentence starts with "I":
  say "It starts with I"
end
say split "hello" by ""
