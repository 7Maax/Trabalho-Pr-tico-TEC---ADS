using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using LocadoraVeiculos.API.Data;
using LocadoraVeiculos.API.DTOs;
using LocadoraVeiculos.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LocadoraVeiculos.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClientesController : ControllerBase
    {
        private readonly LocadoraContext _context;

        public ClientesController(LocadoraContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ClienteResponseDto>>> GetAll()
        {
            var clientes = await _context.Clientes
                .Select(c => new ClienteResponseDto
                {
                    Id = c.Id,
                    Nome = c.Nome,
                    CPF = c.CPF,
                    Email = c.Email,
                    Telefone = c.Telefone,
                    CNH = c.CNH,
                    DataNascimento = c.DataNascimento,
                    DataCadastro = c.DataCadastro
                })
                .ToListAsync();

            return Ok(clientes);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ClienteResponseDto>> GetById(int id)
        {
            var c = await _context.Clientes.FindAsync(id);
            if (c == null)
                return NotFound(new { mensagem = $"Cliente com ID {id} não encontrado." });

            return Ok(new ClienteResponseDto
            {
                Id = c.Id,
                Nome = c.Nome,
                CPF = c.CPF,
                Email = c.Email,
                Telefone = c.Telefone,
                CNH = c.CNH,
                DataNascimento = c.DataNascimento,
                DataCadastro = c.DataCadastro
            });
        }

        [HttpPost]
        public async Task<ActionResult<ClienteResponseDto>> Create([FromBody] ClienteRequestDto dto)
        {
            if (await _context.Clientes.AnyAsync(c => c.CPF == dto.CPF))
                return Conflict(new { mensagem = $"Já existe um cliente cadastrado com o CPF '{dto.CPF}'." });

            if (await _context.Clientes.AnyAsync(c => c.Email == dto.Email))
                return Conflict(new { mensagem = $"Já existe um cliente cadastrado com o e-mail '{dto.Email}'." });

            var cliente = new Cliente
            {
                Nome = dto.Nome,
                CPF = dto.CPF,
                Email = dto.Email,
                Telefone = dto.Telefone,
                CNH = dto.CNH,
                DataNascimento = dto.DataNascimento,
                DataCadastro = DateTime.UtcNow
            };

            _context.Clientes.Add(cliente);
            await _context.SaveChangesAsync();

            var response = new ClienteResponseDto
            {
                Id = cliente.Id,
                Nome = cliente.Nome,
                CPF = cliente.CPF,
                Email = cliente.Email,
                Telefone = cliente.Telefone,
                CNH = cliente.CNH,
                DataNascimento = cliente.DataNascimento,
                DataCadastro = cliente.DataCadastro
            };

            return CreatedAtAction(nameof(GetById), new { id = cliente.Id }, response);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ClienteRequestDto dto)
        {
            var cliente = await _context.Clientes.FindAsync(id);
            if (cliente == null)
                return NotFound(new { mensagem = $"Cliente com ID {id} não encontrado." });

            if (await _context.Clientes.AnyAsync(c => c.CPF == dto.CPF && c.Id != id))
                return Conflict(new { mensagem = $"Já existe outro cliente com o CPF '{dto.CPF}'." });

            if (await _context.Clientes.AnyAsync(c => c.Email == dto.Email && c.Id != id))
                return Conflict(new { mensagem = $"Já existe outro cliente com o e-mail '{dto.Email}'." });

            cliente.Nome = dto.Nome;
            cliente.CPF = dto.CPF;
            cliente.Email = dto.Email;
            cliente.Telefone = dto.Telefone;
            cliente.CNH = dto.CNH;
            cliente.DataNascimento = dto.DataNascimento;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var cliente = await _context.Clientes
                .Include(c => c.Alugueis)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (cliente == null)
                return NotFound(new { mensagem = $"Cliente com ID {id} não encontrado." });

            if (cliente.Alugueis.Any())
                return BadRequest(new { mensagem = "Não é possível excluir um cliente que possui histórico de aluguéis." });

            _context.Clientes.Remove(cliente);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
