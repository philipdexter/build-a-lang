import itertools
import functools
import operator

numbers = itertools.islice(itertools.count(), 10)
summation = functools.reduce(operator.add, numbers, 0)
summation2 = functools.reduce(lambda a, x: a + x, numbers, 0)
product = functools.reduce(lambda a, x: a * x, numbers, 1)

print(summation)
