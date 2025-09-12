using Kubit.Core.Cliente.Handlers;
using Kubit.Core.Cliente.Services.Consulta;
using Kubit.Core.Cliente.Services.Ejecucion;
using Kubit.Core.Cliente.Services.Seguridad;
using Kubit.Core.Cliente.Services.Sistema;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorPages();

builder.Services.AddAuthentication("Cookies")
    .AddCookie("Cookies", options =>
    {
        options.LoginPath = "/Autenticacion/Login";
    });

builder.Services.AddHttpClient<IUsuarioService, UsuarioService>(client =>
{
    client.BaseAddress = new Uri("http://core-servicios.com/");
});

builder.Services.AddHttpClient<IPermisoService, PermisoService>(client =>
{
    client.BaseAddress = new Uri("http://core-servicios.com/");
});

builder.Services.AddHttpClient<IEmpresaService, EmpresaService>(client =>
{
    client.BaseAddress = new Uri("http://core-servicios.com/");
});

builder.Services.AddHttpClient<IFormJsonService, FormJsonService>(client =>
{
    client.BaseAddress = new Uri("http://core-servicios.com/");
});

builder.Services.AddHttpClient<IProgramaService, ProgramaService>(client =>
{
    client.BaseAddress = new Uri("http://core-servicios.com/");
});

builder.Services.AddHttpClient<IParamConsultaService, ParamConsultaService>(client =>
{
    client.BaseAddress = new Uri("http://core-servicios.com/");
});

builder.Services.AddHttpClient<IEjecucionService, EjecucionService>(client =>
{
    client.BaseAddress = new Uri("http://core-servicios.com/");
});

builder.Services.AddScoped<ConsultaHandler>();
builder.Services.AddScoped<SqlHandler>();

builder.Services.AddHttpContextAccessor();
builder.Services.AddAuthorization();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseSession();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapRazorPages();
app.MapFallbackToPage("/Autenticacion/Login");

app.Run();
