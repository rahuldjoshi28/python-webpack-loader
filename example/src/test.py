class Reception:
    def greet(self, firstName, lastName):
        fullName = firstName + " " + lastName
        return "Hello " + fullName


def greet(firstName, lastName):
    rec = Reception()
    return rec.greet(firstName, lastName)
