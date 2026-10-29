# Teach the AI to tell circles from squares, using your drawings
ask picture "Draw a circle" into c1
ask picture "Draw another circle" into c2
ask picture "Draw a square" into s1
ask picture "Draw another square" into s2
teach "circle" with [c1, c2]
teach "square" with [s1, s2]

ask picture "Now draw a circle or a square. I will guess!" into mystery
say "I think it is a " + guess mystery
say "I am " + how sure + "% sure."
