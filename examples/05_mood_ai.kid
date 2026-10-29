# Teach a tiny AI to guess moods
teach "happy" with ["I love this", "yay so fun", "this is great", "I am smiling"]
teach "sad" with ["I feel bad", "this is awful", "I am crying", "so sad today"]

ask "Tell me how your day was" into sentence
set mood to guess sentence
say "I think you feel " + mood
say "I am " + how sure + "% sure."

if how sure < 70:
  say "I'm not very sure. AI can make mistakes!"
end
