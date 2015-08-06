var express = require('express');
var morgan = require('morgan');
var mongoose = require('mongoose');
var path = require('path');
var jade = require('jade');
var bodyParser = require('body-parser');
var slug = require('slug');
var moment = require('moment');
var basicAuth = require('basic-auth')
var app = express();

app.set('port', process.env.PORT || 3000);
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
// app.use(morgan('combined'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/app');

// Schema

var Blog = mongoose.model('Blog', {
	title: String,
	content: String,
	category: String,
	slug: String,
	date: Date,
	fdate: String,
	ftime: String,
	fday: String,
	fmonth: String,
	fyear: String
});

// REST
// resource blog
	// all blogs /blog
	// particular blog /blog/:slug
	// post blog /blog
  // new blog form /blog/new
  // Edit blog form /blog/:slug/edit
// Delete




// Authentication


var auth = function (req, res, next) {
  function unauthorized(res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.sendStatus(401);
  }


  var user = basicAuth(req);

  if (!user || !user.name || !user.pass) {
    return unauthorized(res);
  };


  if (user.name === 'foo' && user.pass === 'bar') {
    return next();
  } else {
    return unauthorized(res);
  };
};




// GET all blogs
app.get('/blog', function(req, res) {
	Blog.find({}, function(err, data) {
		if(err) {
			console.log(err);
			return;
		}
		res.render('blog', {blogs: data});
	});
});

// POST blog
app.post('/blog', function(req, res) {
	var payload = {
		title: req.body.title,
		content: req.body.content,
		category: req.body.category,
		slug: slug(req.body.title).toLowerCase(),
		date: new Date(),
		fdate: moment(new Date()).format('MMMM Do YYYY'),
		ftime: moment(new Date()).format('h:mm:ss a'),
		fday: moment(new Date()).format('Do'),
		fmonth: moment(new Date()).format('MMM'),
		fyear: moment(new Date()).format('YYYY')
	}

	Blog(payload).save(function(err) {
		if(err) {
			console.log(err);
			return
		}
		res.sendStatus(201);
	});
});

// GET new blog templates
app.get('/blog/new', auth, function(req, res) {
	res.render('new');
});

// GET particular blog
app.get('/blog/:id', function(req, res) {
	var id = req.params.id;

	Blog.findById(id, function(err, data) {
		if(err) {
			console.log(err);
			return;
		}
		res.render('blogpage', {blogs: data});
	});
});

app.get('/blog/:id/edit', auth, function(req, res) {
  var id = req.params.id;
  Blog.findById(id, function(err, data) {
    if(err) {
      console.log(err);
      return;
    }
    res.render('edit', {blogs: data});
  });
});

// POST blog post
app.post('/blog/:id', function(req, res) {
  var id = req.params.id;
  Blog.findById(id, function(err, data) {
    console.log(data)
    data.title = req.body.title;
    data.content = req.body.content;
    data.category = req.body.category;

    data.save(function(err) {
      if(err) {
        console.log(err);
        return
      }
      res.sendStatus(200);
    });
  });
});

app.get('/blog/:id/delete', auth, function(req, res) {
  var id = req.params.id;

  Blog.remove({_id: id}, function(err) {
    if(err) {
      console.log(err);
      return
    }
    res.sendStatus(200);
  });
});


app.get('/about', function(req, res) {
	res.render('about');
});

// CLEAR DB
app.get('/db/clear', function(req, res) {
	Blog.remove({}, function(err) {
		if(err)
			console.log(err)
		res.sendStatus(200)
	})
})

app.listen(app.get('port'));
