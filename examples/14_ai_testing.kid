# Real AI makers test their AI on examples it has never seen
teach "happy" with ["I love this", "yay so fun", "this is great", "I am smiling"]
teach "sad" with ["I feel bad", "this is awful", "I am crying", "so sad today"]

test "happy" with ["what a great day", "I love my dog", "fun fun fun"]
say "Happy accuracy: " + how accurate + "%"
test "sad" with ["I feel awful", "today was bad", "I am not happy"]
say "Sad accuracy: " + how accurate + "%"

say guess "my homework is great"
