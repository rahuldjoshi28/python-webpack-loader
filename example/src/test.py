import test2

class Reception:
    def getFullName(self, firstName, lastName):
        return firstName + " " + lastName
    def greet(self, firstName, lastName):
        return "Hello " + self.getFullName(firstName, lastName)

def greet(firstName, lastName):
    p = test2.A()
    return "Hello python world " + Reception().greet(firstName, lastName)
