# A number AI finds a pattern in pairs of numbers: [days of watering, height in cm]
learn "plant" from [[1, 2], [2, 4.1], [3, 5.9], [4, 8.2], [5, 9.8]]

ask "How many days will you water it?" into days
set height to predict "plant" for days
say "After " + days + " days it might be about " + height + " cm tall."
say "The AI is " + how sure + "% sure the pattern fits."
