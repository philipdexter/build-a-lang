def fib(n):
    a = 0
    b = 1
    i = 1
    while i < n:
        a, b = a + b, a
        i += 1
    return a

for i in range(0, 10):
    print(fib(i))
