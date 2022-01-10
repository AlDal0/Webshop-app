require('dotenv').config({ path: '.env' });

module.exports = [
    
    {
        name: 'client',
        entry: './public/js/client.js', //specify which file and his included to modules to compile
        output: {
            path: __dirname + '/public/js', //specify destination file after webpack compilation done
            filename: 'bundle.js',
        },
        module: {
            rules: [
              {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"], //specify webpack modules required by app
              },
            ],
          },
    }
];