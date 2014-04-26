import itertools
import functools
import operator

numbers = itertools.islice(itertools.count(), 10)
summation = functools.reduce(operator.add, numbers)

print(summation)
