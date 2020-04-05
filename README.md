#Python Loader
python-webpack-loader is a webpack based loader which transpile python files into javascript files.
It let you write `python` code in your `javascript` project.

## Set up
1. Install `python-webpack-loader`:
   ```
   npm install --save-dev python-webpack-loader
   ```
2. Configure python-webpack-loader in webpack:
    
    In your webpack config file add following rule inside *module* > *rules*:
    ```
   {
        test: /\.py$/,
        use: [{ loader: 'python-webpack-loader' }]
   }
   ``` 

Now you are ready to use this plugin
You can see simple example of how to use *python-webpack-loader* in `example` folder 