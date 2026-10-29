# A record keeps named facts together
set pet to {name: "Tom", kind: "cat", age: 3}
say pet.name + " is a " + pet.kind
set pet.age to pet.age + 1
set pet.toy to "ball of wool"
say pet
for each fact in pet:
  say fact
end
