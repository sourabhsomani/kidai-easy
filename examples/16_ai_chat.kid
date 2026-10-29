# chat sends a question to a big AI on the internet. Check its answers!
ask "What do you want to ask the big AI?" into question
set reply to chat question
say reply

# Compare: a tiny AI you trained yourself only knows your examples
teach "animal" with ["cat", "dog", "lion"]
teach "food" with ["pizza", "rice", "mango"]
say "My tiny AI thinks " + question + " is about: " + guess question
