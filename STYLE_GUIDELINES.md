# Style Guidelines
Open IO style guidelines are the perfect marriage between legible usefulness and flexibility. We ask contributors to follow the style guidelines below.

### Brackets
Open IO uses Stroustrup style, a variant of K&R, in which K&R extends to fuctions and classes, not just the blocks inside the function. All these brackets have their opening braces on the same line as their respective control statements; closing braces remain in a line of their own, unless followed by a keyword, such as else or while.
```
function partyAtHq(open_io_downloads) {
   if (open_io_downloads >= 1000000) {
      console.log("Party at Open IO HQ!");
   }
}
```

### Function Names  
Javascript functions in Open IO should either be camel case or all lowercase. These two options can be used to easily label functions by their importance and structure within the code. Camel case is the practice of writing phrases such that each word or abbreviation in the middle of the phrase begins with a capital letter, with no intervening spaces or punctuation.
```
openSnakeGameFunction()
```

### File Names
Files that must be easy to find when visiting a repository must be entirely capitalized, in which multiple words are separated by underscores. These files apply to anything that a new user must immediately see once coming accross this repository for the first time, such as the README, LICENSE, CODE_OF_CONDUCT, and of course, this file, STYLE_GUIDELINES. These files must be located in the home (highest) directory of the repository. README.md is an exception, in which separate words should not be underscored.
```
STYLE_GUIDELINES.md
```

