export default async function handler(req, res){

  try{

    const category = req.query.category || "";

    let topic = "";

    switch(category){

      case "world":

        topic = "world";

        break;

      case "tech":

        topic = "technology";

        break;

      case "markets":

        topic = "business";

        break;

      case "science":

        topic = "science";

        break;

      case "culture":

        topic = "entertainment";

        break;

    }

    let url;

    if(topic){

      url =

`https://gnews.io/api/v4/top-headlines?topic=${topic}&lang=en&max=10&apikey=${process.env.GNEWS_API_KEY}`;

    }

    else{

      url =

`https://gnews.io/api/v4/top-headlines?lang=en&max=30&apikey=${process.env.GNEWS_API_KEY}`;

    }

    const response = await fetch(url);

    const data = await response.json();

    res.status(200).json(data);

  }

  catch(error){

    res.status(500).json({

      error:"Failed to fetch news"

    });

  }

}