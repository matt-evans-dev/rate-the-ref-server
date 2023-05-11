# rate-the-ref-server
Rate the Ref Node/Express/Postgres Server

## Setup
- Login to Heroku and open the Rate the Ref Backend Pipeline
- Get the ENV PG credentials from the staging environment

## Get Started
- `yarn`
- `yarn dev`
  
## Deploy

- Automatic deployments to staging envrionment when branch is getting merged into master.



# ESPN API Guide

# SPORTS
# Get Sport, all sports
- Get Sport // DONE
  - http://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams
  - http://site.api.espn.com/apis/site/v2/sports/football/nfl/teams
  - http://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams
  - http://site.api.espn.com/apis/site/v2/sports/baseball/mlb/teams
  - http://site.api.espn.com/apis/site/v2/sports/soccer/usa.1/teams
    - response: { 
        "sports": [{
          "id": "40", 
          "uid": "s:40", 
          "name": "Basketball", 
          "slug": basketball", 
          "leagues": [...leagues]
      }]}

# LEAGUES - controllers/espn-leagues.js
# Get League, all leagues
  - http://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams
  - http://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/teams
  - http://site.api.espn.com/apis/site/v2/sports/basketball/womens-college-basketball/teams
  - http://site.api.espn.com/apis/site/v2/sports/football/nfl/teams
  - http://site.api.espn.com/apis/site/v2/sports/football/college-football/teams
  - http://site.api.espn.com/apis/site/v2/sports/baseball/mlb/teams
  - http://site.api.espn.com/apis/site/v2/sports/baseball/college-baseball/teams
  - http://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams
  - http://site.api.espn.com/apis/site/v2/sports/soccer/usa.1/teams
    - response: { 
        "sports": [{
          ...response,
          "leagues": [{
            "id": "46", 
            "uid": "s:40~l:46", 
            "name": "National Basketball Association",
            "abbreviation": "NBA",
            "slug": basketball",
            "teams": [...teams]
          }]
      }]}

# CONFERENCES - baseball and soccer do not have conferences
# Get Conferences, college basketball, college football
  - https://secure.espn.com/core/mens-college-basketball/schedule?xhr=1&render=true&device=desktop&country=us&lang=en&region=us&site=espn&edition-host=espn.com&site-type=full
  - https://secure.espn.com/core/womens-college-basketball/schedule?xhr=1&render=true&device=desktop&country=us&lang=en&region=us&site=espn&edition-host=espn.com&site-type=full
  - https://secure.espn.com/core/college-football/schedule?xhr=1&render=true&device=desktop&country=us&lang=en&region=us&site=espn&edition-host=espn.com&site-type=full
    - response: {
      ...response,
      "content": {
        ...content,
        "conferenceAPI": {
          "conferences": [
            {
                "uid": "s:40~l:41~g:50",
                "groupId": "50",
                "name": "NCAA Division I",
                "shortName": "Division I"
            },
            {
                "uid": "s:40~l:41~g:3",
                "groupId": "3",
                "name": "Atlantic 10 Conference",
                "subGroups": [],
                "logo": "https://a.espncdn.com/i/teamlogos/ncaa_conf/500/atlantic_10.png",
                "parentGroupId": "50",
                "shortName": "A 10"
            },
            conferences...
          ]
        }
    }}

# Get Conferences - NBA, NFL, NHL
  - https://site.api.espn.com/apis/site/v2/sports/basketball/nba/groups
  - https://site.api.espn.com/apis/site/v2/sports/football/nfl/groups
  - https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/groups
    - response: {
      ...response,
      groups: [
        {
          "name": "Eastern Conference",
          "abbreviation": "East",
          "children": [...children]
        },
        {
          "name": "Western Conference",
          "abbreviation": "West",
          "children": [...children]
        }
      ]
    }

# TEAMS
  ## NBA, NFL, NHL, college football, mens college basketball, womens college basketball
  - Iterate over teams in conference /groups response, fetch data for each team
  - http://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/:id
  - http://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/:id
  - http://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams/:id
    - response: {
      "team": {
        ...team,
        "id": "7",
        "uid": "s:40~l:46~t:7",
        "slug": "denver-nuggets",
        "location": "Denver",
        "name": "Nuggets",
        "abbreviation": "DEN",
        "displayName": "Denver Nuggets",
        "shortDisplayName": "Nuggets",
        "color": "0860A8",
        "alternateColor": "fdb927",
        "isActive": true,
        "logos": [{...logo, "href": "https://a.espncdn.com/i/teamlogos/nba/500/den.png"}, {logo}...],
        "groups": {
          "id": "11",
          "parent": {
              "id": "6"
          },
          "isConference": false
        },
      }
    }

  ## MLB, MLS, college baseball (no conference data on teams)
    - Iterate over teams
    - http://site.api.espn.com/apis/site/v2/sports/baseball/mlb/teams
    - http://site.api.espn.com/apis/site/v2/sports/baseball/college-baseball/teams
    - http://site.api.espn.com/apis/site/v2/sports/soccer/usa.1/teams

      - response: {
        "sports": [
          {
            ...sport,
            "leagues": [
              {
                ...league,
                "teams": [
                  "id": "20",
                  "uid": "s:40~l:59~t:20",
                  "slug": "atlanta-dream",
                  "location": "Atlanta",
                  "name": "Dream",
                  "abbreviation": "ATL",
                  "displayName": "Atlanta Dream",
                  "shortDisplayName": "Dream",
                  "color": "5190cd",
                  "alternateColor": "f1f2f3",
                  "isActive": true,
                  "logos": [{...logo, "href": "https://a.espncdn.com/i/teamlogos/nba/500/den.png"}, {logo}...] 
                ]
              }
            ]
          }
        ]
      }

# SCHEDULE - no college baseball
# NBA, mens college basketball, womens college basketball, MLB & MLS but regular season dates not listed
  - Get start and end dates:
  - https://secure.espn.com/core/nba/scoreboard?xhr=1&render=true&device=desktop&country=us&lang=en&region=us&site=espn&edition-host=espn.com&site-type=full
    - response: {
      ... response,
      "content": {
        ...content,
        "sbData": {
          "leagues": [
            {
              ...calendar,
              "calendarEndDate": "2020-07-01T06:59Z",
              "calendarStartDate": "2019-09-28T07:00Z"
            }
          ]
        }
      }
    }
  - For each date in season, send fetch for games with format YYYYMMDD:
  - https://secure.espn.com/core/nba/schedule?xhr=1&render=true&device=desktop&country=us&lang=en&region=us&site=espn&edition-host=espn.com&site-type=full&date=:date
    - response: {
      ... schedule,
      "content": {
        ...content,
        "schedule": {
          "20200304": {
            ...dayInfo,
            "games: [
              {
                "id": "401161559",
                "date": "2020-03-05T00:00Z",
                "uid": "s:40~l:46~e:401161559",
                "name": "Boston Celtics at Cleveland Cavaliers",
                "competitions": [
                  {
                    "date": "2020-03-05T00:00Z",
                    "venue": {
                      "address": {
                        "city": "Cleveland",
                        "state": "OH"
                      },
                      "fullName": "Rocket Mortgage FieldHouse",
                      "indoor": false,
                      "id": "3417",
                      "capacity": 19432
                    },
                    "uid": "s:40~l:46~e:401161559~c:401161559",
                    "competitors": [
                      {
                        "uid": "s:40~l:46~t:5",
                        "homeAway": "home",
                        "id": "5",
                        "team": {
                          "alternateColor": "fdbb30",
                          "venue": {
                            "id": "3417"
                          },
                          "color": "061642",
                          "displayName": "Cleveland Cavaliers",
                          "abbreviation": "CLE",
                          "isActive": true,
                          "shortDisplayName": "Cavaliers",
                          "uid": "s:40~l:46~t:5",
                          "name": "Cavaliers",
                          "logo": "https://a.espncdn.com/i/teamlogosscoreboard/cle.png",
                          "location": "Cleveland",
                        }
                      },
                      {
                        "uid": "s:40~l:46~t:2",
                        "homeAway": "away",
                        "id": "2",
                        "team": {
                          "alternateColor": "f1f2f3",
                          "venue": {
                              "id": "1824"
                          },
                          "color": "006532",
                          "displayName": "Boston Celtics",
                          "abbreviation": "BOS",
                          "isActive": true,
                          "shortDisplayName": "Celtics",
                          "uid": "s:40~l:46~t:2",
                          "name": "Celtics",
                          "logo": "https://a.espncdn.com/i/teamlogo scoreboard/bos.png",
                          "location": "Boston",
                        }
                      }
                    ]
                  }
                ]
              }
            ]
          }
        }
      }
    }

# do both of these when season rolls around 
# NFL - can only get through week 5, college football except final week 
  - Get total weeks in season by finding calendar where label is Regular Season
  - https://secure.espn.com/core/nfl/schedule?xhr=1&render=true&device=desktop&country=us&lang=en&region=us&site=espn&edition-host=espn.com&site-type=full
    - response: {
      ...response,
      "content": {
        ...content,
        "calendar": [
          {
            "entries": [
              ...entries,
              {
                "endDate": "2019-10-09T06:59Z",
                "alternateLabel": "Week 5",
                "label": "Week 5",
                "detail": "Oct 2-8",
                "value": "5",
                "startDate": "2019-10-02T07:00Z"
              }
            ]
            "endDate": "2020-01-01T07:59Z",
            "label": "Regular Season",
             "value": "2",
            "startDate": "2019-09-05T07:00Z"
          },
          {calendar}...
        ]
      }
    }
  - For each week get games
  - https://secure.espn.com/core/nfl/schedule?xhr=1&render=true&device=desktop&country=us&lang=en&region=us&site=espn&edition-host=espn.com&site-type=full&week=:number


# VENUES NBA, NFL, NHL, MLS, college football, mens college bball, womens college bball, college baseball

# Refs

