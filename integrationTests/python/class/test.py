class Maths:
    def add(self, a, b):
        return a + b
    def increment(self, i):
        return self.add(i, 1)

maths = Maths()
print(maths.increment(2))